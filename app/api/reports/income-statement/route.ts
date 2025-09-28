import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transaction, category } from '@/db/schema/finance';
import { eq, and, gte, lte } from 'drizzle-orm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { fromDate, toDate } = body;

    // Convert date strings to Date objects if needed
    const startDate = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = toDate ? new Date(toDate) : new Date();

    // Get income transactions for the specified date range with category names
    const incomeTransactions = await db
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
          eq(transaction.type, 'income'),
          gte(transaction.date, startDate.toISOString().split('T')[0]),
          lte(transaction.date, endDate.toISOString().split('T')[0])
        )
      );

    // Group income by category
    const incomeByCategory: Record<string, number> = {};
    incomeTransactions.forEach(transaction => {
      const categoryName = transaction.categoryName || 'Uncategorized';
      if (!incomeByCategory[categoryName]) {
        incomeByCategory[categoryName] = 0;
      }
      incomeByCategory[categoryName] += Number(transaction.amount);
    });

    // Calculate total income
    const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const { width, height } = page.getSize();
    
    // Embed the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    page.drawText('Income Statement', {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Period
    page.drawText(
      `Period: ${format(startDate, 'MMM dd, yyyy', { locale: id })} - ${format(endDate, 'MMM dd, yyyy', { locale: id })}`, 
      {
        x: 50,
        y: height - 80,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    // Section title
    page.drawText('Income by Category', {
      x: 50,
      y: height - 120,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Table headers
    page.drawText('Category', {
      x: 60,
      y: height - 150,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText('Amount', {
      x: width - 100,
      y: height - 150,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw a line under headers
    page.drawLine({
      start: { x: 50, y: height - 155 },
      end: { x: width - 50, y: height - 155 },
      thickness: 1,
    });

    // Table rows
    let yPosition = height - 170;
    const rowHeight = 20;
    
    for (const [category, amount] of Object.entries(incomeByCategory)) {
      // Category name
      page.drawText(category, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      // Amount
      page.drawText(`Rp${Number(amount).toLocaleString('id-ID')}`, {
        x: width - 100,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= rowHeight;
    }

    // Total income row
    page.drawLine({
      start: { x: 50, y: yPosition + 5 },
      end: { x: width - 50, y: yPosition + 5 },
      thickness: 1,
    });
    
    page.drawText('Total Income', {
      x: 60,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rp${totalIncome.toLocaleString('id-ID')}`, {
      x: width - 100,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="income-statement-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating income statement:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}