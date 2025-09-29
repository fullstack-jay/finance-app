import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { asset, investment, transaction, category } from '@/db/schema/finance';
import { eq, and, lte } from 'drizzle-orm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Clerk's user ID
    const userId = user.id;
    const body = await req.json();
    const { toDate } = body;

    // Convert date string to Date object if needed
    const endDate = toDate ? new Date(toDate) : new Date();

    // Get user's assets
    const userAssets = await db
      .select()
      .from(asset)
      .where(eq(asset.userId, userId));

    // Calculate total assets value
    const totalAssets = userAssets.reduce((sum, asset) => sum + Number(asset.currentValue || asset.purchasePrice), 0);

    // Get user's investments
    const userInvestments = await db
      .select()
      .from(investment)
      .where(eq(investment.userId, userId));
    
    const totalInvestments = userInvestments.reduce((sum, investment) => sum + Number(investment.currentValue), 0);

    // Get user's liabilities (for simplicity, treating expenses as liabilities in this period)
    // In a real application, you might have a separate liabilities table
    const liabilityTransactions = await db
      .select({
        id: transaction.id,
        userId: transaction.userId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        categoryName: category.name
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, 'expense'),
          lte(transaction.date, endDate.toISOString().split('T')[0])
        )
      );
    
    const totalLiabilities = liabilityTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    // Calculate equity (assets - liabilities)
    const totalEquity = totalAssets + totalInvestments - totalLiabilities;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const { width, height } = page.getSize();
    
    // Embed the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    page.drawText('Balance Sheet', {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Date
    page.drawText(`As of: ${format(endDate, 'MMM dd, yyyy', { locale: id })}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Assets section
    page.drawText('Assets', {
      x: 50,
      y: height - 110,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Assets table headers
    page.drawText('Asset', {
      x: 60,
      y: height - 140,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText('Value', {
      x: width - 100,
      y: height - 140,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw a line under headers
    page.drawLine({
      start: { x: 50, y: height - 145 },
      end: { x: width - 50, y: height - 145 },
      thickness: 1,
    });

    // Assets table rows
    let yPosition = height - 160;
    const rowHeight = 20;
    
    // Add assets
    for (const asset of userAssets) {
      page.drawText(asset.name, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Rp${Number(asset.currentValue || asset.purchasePrice).toLocaleString('id-ID')}`, {
        x: width - 100,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= rowHeight;
    }

    // Add investments
    for (const investment of userInvestments) {
      page.drawText(investment.name, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Rp${Number(investment.currentValue).toLocaleString('id-ID')}`, {
        x: width - 100,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= rowHeight;
    }

    // Total assets row
    page.drawLine({
      start: { x: 50, y: yPosition + 5 },
      end: { x: width - 50, y: yPosition + 5 },
      thickness: 1,
    });
    
    page.drawText('Total Assets', {
      x: 60,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rp${totalAssets.toLocaleString('id-ID')}`, {
      x: width - 100,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Move down for liabilities section
    yPosition -= 40;
    page.drawText('Liabilities', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Liabilities row
    page.drawText('Total Liabilities (Expenses)', {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rp${totalLiabilities.toLocaleString('id-ID')}`, {
      x: width - 100,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Total liabilities row
    yPosition -= rowHeight;
    page.drawLine({
      start: { x: 50, y: yPosition + 5 },
      end: { x: width - 50, y: yPosition + 5 },
      thickness: 1,
    });
    
    page.drawText('Total Liabilities', {
      x: 60,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rp${totalLiabilities.toLocaleString('id-ID')}`, {
      x: width - 100,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Move down for equity section
    yPosition -= 40;
    page.drawText('Equity', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Total equity row
    page.drawText('Total Equity (Assets - Liabilities)', {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rp${totalEquity.toLocaleString('id-ID')}`, {
      x: width - 100,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Summary section
    yPosition -= 40;
    page.drawText('Summary', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Assets: Rp${totalAssets.toLocaleString('id-ID')}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    page.drawText(`Liabilities: Rp${totalLiabilities.toLocaleString('id-ID')}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    page.drawText(`Equity: Rp${totalEquity.toLocaleString('id-ID')}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    page.drawText(`Verification (Assets = Liabilities + Equity):`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    page.drawText(`Rp${totalAssets.toLocaleString('id-ID')} = Rp${(totalLiabilities + totalEquity).toLocaleString('id-ID')}`, {
      x: 70,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="balance-sheet-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}