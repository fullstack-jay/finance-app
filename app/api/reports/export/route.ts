import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transaction, category } from '@/db/schema/finance';
import { eq, and, gte, lte } from 'drizzle-orm';
import { format } from 'date-fns';

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
    const { fromDate, toDate, format: exportFormat } = body;

    // Konversi tanggal
    const startDate = fromDate
      ? new Date(fromDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = toDate ? new Date(toDate) : new Date();

    // Ambil data transaksi dengan nama kategori
    const transactionData = await db
      .select({
        id: transaction.id,
        userId: transaction.userId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        categoryName: category.name,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, startDate.toISOString().split('T')[0]),
          lte(transaction.date, endDate.toISOString().split('T')[0])
        )
      );

    if (exportFormat === 'csv') {
      // BOM supaya Excel baca UTF-8 dengan benar
      const BOM = '\uFEFF';

      // Header (A1 = Date, B1 = Description, dst)
      let csvContent = BOM + 'Date;Description;Category;Type;Amount\r\n';

      // Baris data
      transactionData.forEach((trx) => {
        const date = format(new Date(trx.date), 'yyyy-MM-dd');
        const description = (trx.description || '').replace(/"/g, '""');
        const categoryName = (trx.categoryName || '').replace(/"/g, '""');
        const type = (trx.type ?? '').toString().replace(/"/g, '""');
        const amount = Number(trx.amount) || 0;

        // Pisahkan dengan `;`
        csvContent += `${date};"${description}";"${categoryName}";"${type}";${amount}\r\n`;
      });

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="financial-report-${format(
            new Date(),
            'yyyy-MM-dd'
          )}.csv"`,
        },
      });
    } else {
      return Response.json(
        { error: 'Unsupported format. Only CSV is supported.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
