import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — MIRAVIKA" }] }),
  component: () => (
    <PolicyPage title="Terms & Conditions">
      <p>By accessing or using miravika.in (the "Site"), you agree to these terms. Please read them carefully.</p>
      <h2>Orders</h2>
      <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.</p>
      <h2>Pricing</h2>
      <p>All prices are in INR and inclusive of taxes. We reserve the right to change pricing at any time without notice.</p>
      <h2>Intellectual property</h2>
      <p>All content on the Site, including images, text and designs, belongs to MIRAVIKA and may not be used without written permission.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of the courts of Jaipur.</p>
    </PolicyPage>
  ),
});
