import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createOrder } from "@/lib/models";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, phone, address, items, total, email } = await req.json();

  // Try to get user ID if authenticated
  let userId: string | undefined;
  try {
    const token = req.cookies.get('token')?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }
  } catch (error) {
    // Ignore auth errors - order can still be created without user
  }

  // Save order to database
  try {
    await createOrder({
      userId,
      name,
      email,
      phone,
      address,
      items,
      total,
      status: 'pending',
      paymentMethod: 'Sur place',
    });
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement de la commande:", error);
    // Continue even if database save fails - still try to send email
  }

  // Send email notification
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <h2>Nouvelle commande</h2>
    <p><b>Nom:</b> ${name}</p>
    <p><b>Téléphone:</b> ${phone}</p>
    ${email ? `<p><b>Email:</b> ${email}</p>` : ''}
    <p><b>Adresse:</b> ${address}</p>
    <h3>Produits:</h3>
    <ul>
      ${items.map((item: any) => `<li>${item.name} x${item.quantity} - ${item.price}€</li>`).join("")}
    </ul>
    <p><b>Total:</b> ${total}€</p>
    <p><b>Paiement:</b> Sur place</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "zgolliaziz206@gmail.com",
      subject: "Nouvelle commande Soltana Pâtisserie",
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Erreur Nodemailer:", e);
    return NextResponse.json({ ok: false, error: e.message, detail: e }, { status: 500 });
  }
}