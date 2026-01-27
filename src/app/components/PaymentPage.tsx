import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Check, CreditCard } from "lucide-react";

interface PaymentPageProps {
  namesCount: number;
  onNext: (plan: string) => void;
  onBack: () => void;
}

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    limit: 50,
    features: ["Up to 50 cards", "All pages included", "Download as ZIP"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 199,
    limit: 200,
    features: ["Up to 200 cards", "All pages included", "Download as ZIP", "Priority support"],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 399,
    limit: Infinity,
    features: ["Unlimited cards", "All pages included", "Download as ZIP", "Priority support", "24/7 chat support"],
  },
];

export function PaymentPage({ namesCount, onNext, onBack }: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");

  const handlePayment = () => {
    // In real implementation, integrate with Razorpay
    alert("Payment integration with Razorpay would be implemented here");
    onNext(selectedPlan);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">
            You need to generate {namesCount} card{namesCount > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isRecommended = namesCount <= plan.limit && (plans.find(p => namesCount <= p.limit)?.id === plan.id);
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 border-2 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                } ${plan.popular ? "scale-105" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                {isRecommended && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                      Recommended
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl">₹{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.limit === Infinity ? "Unlimited" : `Up to ${plan.limit}`} cards
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                    disabled={namesCount > plan.limit}
                  >
                    {namesCount > plan.limit ? "Not enough" : isSelected ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex-1">
                <p className="text-sm text-blue-900">
                  ✓ No monthly charges • One-time payment • Instant download
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={handlePayment} className="gap-2">
            <CreditCard className="h-5 w-5" />
            Pay ₹{plans.find((p) => p.id === selectedPlan)?.price} Now
          </Button>
        </div>
      </div>
    </div>
  );
}
