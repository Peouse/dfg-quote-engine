import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { leadData, cart } = await req.json();

        if (!leadData.id) {
            return NextResponse.json({ error: "Lead ID missing." }, { status: 400 });
        }

        if (!cart || cart.length === 0) {
            return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
        }

        const totalItems = cart.length;
        const totalQty = cart.reduce((acc: number, item: { quantity: number;[key: string]: unknown }) => acc + item.quantity, 0);

        // 1. Save quote to `quotes` table
        const { data: quote, error: quoteError } = await supabase
            .from("quotes")
            .insert([
                { lead_id: leadData.id, total_items: totalItems, total_qty: totalQty }
            ])
            .select()
            .single();

        if (quoteError) {
            console.error("Quote Creation Error:", quoteError);
            return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
        }

        // 2. Save quote items
        const quoteItemsData = cart.map((item: { oemCode: string; description: string; quantity: number;[key: string]: unknown }) => ({
            quote_id: quote.id,
            oem_code: item.oemCode,
            description: item.description,
            quantity: item.quantity,
            // Formula placeholder for DB if needed, but not strictly executed in DB.
            subtotal_formula: "=E[row]*F[row]"
        }));

        const { error: itemsError } = await supabase
            .from("quote_items")
            .insert(quoteItemsData);

        if (itemsError) {
            console.error("Quote Items Error:", itemsError);
            return NextResponse.json({ error: "Failed to create quote items" }, { status: 500 });
        }

        // 3. Generate internal `.xlsx` File
        // 3. Generate internal `.xlsx` File
        // Create Excel worksheet
        const wsData: (string | number | { f: string })[][] = [
            ["DATOS DEL CLIENTE"],
            ["Nombre:", leadData.fullName],
            ["Empresa:", leadData.company],
            ["Perfil:", leadData.profileTag || ""],
            ["Líneas de Interés:", Array.isArray(leadData.interestTags) ? leadData.interestTags.join(", ") : (leadData.interestTags || "")],
            ["WhatsApp / Celular:", leadData.whatsapp || ""],
            ["Correo:", leadData.email],
            [],
            ["RESUMEN DE LA PROFORMA"],
            ["QR / ID de Proforma:", quote.id.substring(0, 8)],
            ["Total de Ítems Distintos:", totalItems],
            ["Total de Piezas Solicitadas:", totalQty],
            [],
            ["ITEM", "OEM CODE", "DESCRIPCIÓN", "QTY", "UNIT PRICE", "SUBTOTAL"]
        ];

        cart.forEach((item: { oemCode: string; description: string; quantity: number;[key: string]: unknown }, index: number) => {
            const rowNum = index + 15; // 1-indexed for formula (+14 for header offset)
            wsData.push([
                index + 1,
                item.oemCode,
                item.description,
                item.quantity,
                0, // placeholder unit price
                { f: `D${rowNum}*E${rowNum}` } // Live Formula
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-fit column widths
        worksheet["!cols"] = [
            { wch: 10 },  // ITEM
            { wch: 25 },  // OEM CODE
            { wch: 60 },  // DESCRIPCIÓN
            { wch: 10 },  // QTY
            { wch: 15 },  // UNIT PRICE
            { wch: 15 }   // SUBTOTAL
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Proforma");

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        // 4. Send Email via Nodemailer
        if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                }
            });

            const logoPath = path.join(process.cwd(), "public", "logo.png");
            const attachments: { filename: string; content?: Buffer; contentType?: string; path?: string; cid?: string }[] = [
                {
                    filename: `DFG_Quote_${quote.id.substring(0, 8)}.xlsx`,
                    content: excelBuffer,
                    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            ];

            try {
                if (fs.existsSync(logoPath)) {
                    attachments.push({
                        filename: "logo.png",
                        path: logoPath,
                        cid: "companylogo"
                    });
                }
            } catch (e) {
                console.warn("Could not attach logo", e);
            }

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: ["peouse@gmail.com", leadData.email],
                subject: `🚨 NUEVO LEAD EN FERIA: ${leadData.company} - Proforma #${quote.id.substring(0, 8)}`,
                html: `
<p>Hola Equipo Comercial,</p>
<p>El cliente ha generado una proforma a través de la App DFG Tech. Encuentra adjunto el archivo Excel con sus datos de contacto y la lista de códigos solicitados, listo para que ingreses los precios y envíes la cotización oficial.</p>
<br/>
<h3>👤 DATOS DEL CLIENTE:</h3>
<ul>
    <li><b>Nombre:</b> ${leadData.fullName}</li>
    <li><b>Empresa:</b> ${leadData.company}</li>
    <li><b>Perfil:</b> ${leadData.profileTag || ""}</li>
    <li><b>Líneas de Interés:</b> ${Array.isArray(leadData.interestTags) ? leadData.interestTags.join(", ") : (leadData.interestTags || "")}</li>
    <li><b>WhatsApp / Celular:</b> ${leadData.whatsapp || ""}</li>
    <li><b>Correo:</b> ${leadData.email}</li>
</ul>
<br/>
<h3>🛒 RESUMEN DE LA PROFORMA (QR: #${quote.id.substring(0, 8)}):</h3>
<ul>
    <li><b>Total de Ítems Distintos:</b> ${totalItems}</li>
    <li><b>Total de Piezas Solicitadas:</b> ${totalQty}</li>
</ul>
<br/>
<br/>
<img src="cid:companylogo" alt="DFG Logo" style="height: 50px; width: auto;" />
                `,
                attachments
            };

            await transporter.sendMail(mailOptions);
            console.log(`[Sales Integration] Triggered automated email to peouse@gmail.com and ${leadData.email}`);
        } else {
            console.warn("[Sales Integration] SMTP credentials not configured. Please add SMTP_EMAIL and SMTP_PASSWORD to .env.local to enable emails.");
        }

        return NextResponse.json({ success: true, quoteId: quote.id });
    } catch (err) {
        console.error("API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
