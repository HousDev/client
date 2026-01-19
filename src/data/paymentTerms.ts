const classifiedPaymentTerms = [
  {
    category: "Advance",
    details: [
      {
        id: 1,
        percent: "",
        materialPercent: "",
        triggerEvent: "order confirmation",
        days: 5,
        content:
          "${percent}% advance payment payable after order confirmation.",
        displayContent: "20% advance payment payable after order confirmation.",
      },
      {
        id: 2,
        percent: "",
        materialPercent: "",
        triggerEvent: "before payment",
        days: null,
        content: "${percent}% payment before dispatch of material.",
        displayContent: "15% payment before dispatch of material.",
      },
    ],
  },

  {
    category: "Quantity",
    details: [
      {
        id: 3,
        percent: "",
        materialPercent: "",
        triggerEvent: "quantity",
        days: 30,
        content:
          "${percent}% payment after receiving ${materialPercent}% material within ${days} days.",
        displayContent:
          "10% payment after receiving 10% material within 30 days.",
      },
    ],
  },
];

export default classifiedPaymentTerms;
