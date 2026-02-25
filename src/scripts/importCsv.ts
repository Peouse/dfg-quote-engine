import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

const csvPath = path.resolve(process.cwd(), '../docs/dfg-product-list.csv');
const outputPath = path.resolve(process.cwd(), 'src/data/mockProducts.ts');

const fileContent = fs.readFileSync(csvPath, 'utf8');
const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
});

const products = (records as Record<string, string>[]).map((record, index: number) => {
    const rawLinkPhoto = record['LINK PHOTO'] || '';

    // Split the links by comma and clean them up
    const linkPhotosRaw = rawLinkPhoto.split(',').map((l: string) => l.trim()).filter(Boolean);

    const processedImages: string[] = linkPhotosRaw.map((link: string) => {
        // Convert Google Drive view links to direct image links
        const driveMatch = link.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch && driveMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
        }
        return link; // Return as-is if it's already a direct link or different format
    });

    return {
        id: `p${index + 1}`,
        oemCode: record['OEM CODE'] || '',
        description: record['DESCRIPCIÓN'] || '',
        family: record['FAMILIA'] || 'Other',
        subfamily: record['SUBFAMILIA'] || '',
        linea: record['LINEA'] || '',
        aplicacion: record['APLICACION'] || '',
        images: processedImages
    };
});

const families = Array.from(new Set(products.map((p: { family: string }) => p.family))).filter(Boolean);

const outputContent = `// Automatically generated from dfg-product-list.csv
export interface Product {
  id: string;
  oemCode: string;
  description: string;
  family: string;
  subfamily: string;
  linea: string;
  aplicacion: string;
  images: string[];
}

export const FAMILIES = ${JSON.stringify(families, null, 2)};

export const MOCK_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent);
console.log('Successfully generated mockProducts.ts from CSV');
