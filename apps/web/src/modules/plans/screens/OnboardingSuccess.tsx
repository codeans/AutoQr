import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../../../components/marketing/shared/Container";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchOnboardingOrder } from "../services/plans.service";
import { formatCurrency } from "../types";
import type { OnboardingOrder } from "../types";

export const OnboardingSuccessScreen = () => {
  const { i18n } = useTranslation();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const manualReview = params.get("manualReview") === "1";
  const isPublicCheckout = params.get("public") === "1";
  const [order, setOrder] = useState<OnboardingOrder | null>(null);

  useEffect(() => {
    if (!orderId) return;
    if (isPublicCheckout) return;
    fetchOnboardingOrder(orderId).then(setOrder).catch(() => undefined);
  }, [orderId, isPublicCheckout]);

  const awaitingReview = manualReview || order?.paymentStatus === "pending";

  return (
    <SectionWrapper>
      <Container>
        <Reveal>
          <div className="mx-auto max-w-xl rounded-3xl border border-surface-border bg-surface-soft p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-2xl text-brand-700">
              {isPublicCheckout ? "✓" : awaitingReview ? "⏳" : "✓"}
            </div>
            {isPublicCheckout ? (
              <dl className="mt-8 grid gap-2 rounded-2xl bg-white/60 p-6 text-left text-[14px] text-content">
                <h1 className="mt-6 font-display text-3xl text-content">Your order has been received.</h1>
                <p className="mt-3 text-[15px] text-content-muted">
                  Your order has been received. We will ship your AutoQr code to your address. Your personal setup data is not
                  linked until you activate your QR after receiving it.
                </p>
                <p className="mt-4 text-[15px] text-content-muted">
                  Your payment and shipping details are used only to process and deliver your order. Your QR becomes active only
                  after you create your account and activate it with your activation code.
                </p>
              </dl>
            ) : (
              <>
                <h1 className="mt-6 font-display text-3xl text-content">
                  {awaitingReview ? "Order received." : "You're in."}
                </h1>
                <p className="mt-3 text-[15px] text-content-muted">
                  {awaitingReview
                    ? "Your order is queued for manual review. Our team will confirm payment and start fulfillment — you'll get a notification once it's approved."
                    : "Your plan is set up. We'll ship your tags and send the activation codes as soon as they leave the warehouse."}
                </p>
                {order && (
                  <dl className="mt-8 grid gap-2 rounded-2xl bg-white/60 p-6 text-left text-[14px] text-content">
                    <div className="flex justify-between">
                      <dt className="text-content-subtle">Plan</dt>
                      <dd>{order.planSnapshot?.name ?? "AutoQR plan"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-content-subtle">Order ID</dt>
                      <dd className="font-mono text-[13px]">{order._id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-content-subtle">Total</dt>
                      <dd>{formatCurrency(Math.round(order.amount * 100), order.currency, i18n.language)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-content-subtle">Payment</dt>
                      <dd className="capitalize">{order.paymentStatus}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-content-subtle">Status</dt>
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
                    className="rounded-full border border-surface-border px-6 py-3 text-[14px] text-content hover:bg-surface-soft"
                  >
                    Activate a tag
                  </Link>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  );
};
