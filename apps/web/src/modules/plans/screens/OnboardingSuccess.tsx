import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "../../../components/marketing/shared/Container";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchOnboardingOrder } from "../services/plans.service";
import { formatCurrency } from "../types";
import type { OnboardingOrder } from "../types";

export const OnboardingSuccessScreen = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const manualReview = params.get("manualReview") === "1";
  const [order, setOrder] = useState<OnboardingOrder | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOnboardingOrder(orderId).then(setOrder).catch(() => undefined);
  }, [orderId]);

  const awaitingReview = manualReview || order?.paymentStatus === "pending";

  return (
    <SectionWrapper>
      <Container>
        <Reveal>
          <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-2xl text-accent">
              {awaitingReview ? "⏳" : "✓"}
            </div>
            <h1 className="mt-6 font-display text-3xl text-fog-50">
              {awaitingReview ? "Order received." : "You're in."}
            </h1>
            <p className="mt-3 text-[15px] text-fog-300">
              {awaitingReview
                ? "Your order is queued for manual review. Our team will confirm payment and start fulfillment — you'll get a notification once it's approved."
                : "Your plan is set up. We'll ship your tags and send the activation codes as soon as they leave the warehouse."}
            </p>
            {order && (
              <dl className="mt-8 grid gap-2 rounded-2xl bg-ink-900/60 p-6 text-left text-[14px] text-fog-200">
                <div className="flex justify-between">
                  <dt className="text-fog-400">Plan</dt>
                  <dd>{order.planSnapshot?.name ?? "AutoQR plan"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fog-400">Order ID</dt>
                  <dd className="font-mono text-[13px]">{order._id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fog-400">Total</dt>
                  <dd>{formatCurrency(Math.round(order.amount * 100), order.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fog-400">Payment</dt>
                  <dd className="capitalize">{order.paymentStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fog-400">Status</dt>
                  <dd className="capitalize">{order.orderStatus.replace(/_/g, " ")}</dd>
                </div>
              </dl>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/dashboard"
                className="rounded-full bg-fog-50 px-6 py-3 text-[14px] font-medium text-ink-950 hover:bg-white"
              >
                Open dashboard
              </Link>
              <Link
                to="/dashboard/activate"
                className="rounded-full border border-white/10 px-6 py-3 text-[14px] text-fog-100 hover:bg-white/[0.04]"
              >
                Activate a tag
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  );
};
