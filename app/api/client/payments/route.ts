import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import {
  getMonthStatus,
  getPayments,
  reportPayment,
  ApiError,
  type PaymentMethod,
  type ReportPaymentInput,
} from "@/lib/coachApi";

export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const yearParam = req.nextUrl.searchParams.get("year");
  const monthParam = req.nextUrl.searchParams.get("month");

  try {
    // With year+month → estado de un mes; sin params → historial completo.
    if (yearParam && monthParam) {
      const status = await getMonthStatus(
        Number(yearParam),
        Number(monthParam),
        session.token
      );
      return NextResponse.json({ data: status });
    }
    const payments = await getPayments(session.token);
    return NextResponse.json({ data: payments });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      session.destroy();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "amount inválido" }, { status: 400 });
  }
  if (!body.year || !body.month || body.month < 1 || body.month > 12) {
    return NextResponse.json({ error: "year/month inválido" }, { status: 400 });
  }

  const input: ReportPaymentInput = {
    year: body.year,
    month: body.month,
    amount: body.amount,
    method: body.method as PaymentMethod | undefined,
    currency: body.currency,
    note: body.note,
    receiptKey: body.receiptKey,
  };

  try {
    const payment = await reportPayment(input, session.token);
    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        session.destroy();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
