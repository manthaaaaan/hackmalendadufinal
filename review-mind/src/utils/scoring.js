// src/utils/scoring.js

export const getTrendArrow = (current, previous) => {
  if (previous === null || previous === undefined) return { symbol: "●", color: "text-brand-primary", text: "NEW" };
  const diff = current - previous;
  if (diff >= 3) return { symbol: "↑", color: "text-brand-success", text: `+${diff.toFixed(0)}` };
  if (diff <= -3) return { symbol: "↓", color: "text-brand-error", text: `${diff.toFixed(0)}` };
  return { symbol: "→", color: "text-brand-textSecondary", text: diff > 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0) };
};

export const getSeverityBadge = (score) => {
  if (score < 50) return { label: "High", colorClass: "bg-brand-error text-white" };
  if (score <= 70) return { label: "Medium", colorClass: "bg-brand-warning text-white" };
  return { label: "Low", colorClass: "bg-brand-success text-white" };
};

// Calculates health (0-100) based on category complaint density relative to total dataset
export const calcSubScore = (reviews, categoryCondition) => {
  if (!reviews || reviews.length === 0) return 100;
  
  // Only negative reviews in this category count as deductions
  const negativeComplaints = reviews.filter(r => categoryCondition(r) && r.sentiment === 'negative');
  
  // Math: 100 - ((NegComplaints / Total) * 100)
  // This means if 5% of all users complain about Quality, the Quality score is 95.
  const deduction = (negativeComplaints.length / reviews.length) * 100;
  return Math.max(0, Math.round(100 - deduction));
};

export const calcBrandHealthScore = (scores) => {
  const { productQuality, deliveryExperience, packagingIntegrity, sentimentTrend } = scores;
  return Math.round((productQuality + deliveryExperience + packagingIntegrity + sentimentTrend) / 4);
};

export const generateTickets = (painPointAggregations) => {
  // Take top 3 pain points
  const topPainPoints = Object.entries(painPointAggregations)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const actionMap = {
    "product quality": "Escalate to product team for urgent review",
    "delivery issue": "Review logistics partner SLA agreements",
    "packaging problem": "Audit packaging line QC process",
    "customer service": "Schedule customer service team retraining",
    "pricing concern": "Conduct competitor pricing analysis",
    "sizing issue": "Update sizing guide on product listing"
  };

  const explanationMap = {
    "product quality": "AI analysis indicates customers are frequently reporting defects, missing parts, or poor build quality upon receiving the item.",
    "delivery issue": "Multiple reviews indicate late deliveries, lost packages, or poor handling by the assigned logistics courier.",
    "packaging problem": "Products are arriving damaged due to insufficient bubble wrap, crushed boxes, or poor seal integrity.",
    "customer service": "Users report dissatisfaction with long wait times, unhelpful staff, or completely ignored communication.",
    "pricing concern": "The consensus metric indicates the product is perceived as overpriced compared to current market alternatives.",
    "sizing issue": "Items are consistently running too small or too large compared to standard garment sizing metrics."
  };
  
  const solutionDetailMap = {
    "product quality": "Initiate a QA halt to inspect the current manufacturing batch. Request immediate factory audits and match complains to batch IDs.",
    "delivery issue": "Aggregate courier tracking numbers from recent complaints and file a bulk SLA breach claim with the shipping provider.",
    "packaging problem": "Switch to reinforced corrugated boxes and add foam inserts to fragile components before the next shipping cycle.",
    "customer service": "Deploy an AI chatbot to intercept level-1 tickets to reduce queue times, and schedule mandatory empathy retraining.",
    "pricing concern": "Deploy limited-time promotional discount codes or temporarily adjust MSRP to match competitor parity.",
    "sizing issue": "Update the storefront with a highly visible sizing chart and prominently add 'fits small/large' warnings to the UI."
  };

  return topPainPoints.map(([category, data]) => {
    // Generate mock score based on sentiment to determine priority
    const score = (data.positive / data.count) * 100;
    let priority = "P3";
    let priorityColor = "bg-brand-success text-white";
    if (score < 50) { priority = "P1"; priorityColor = "bg-brand-error text-white"; }
    else if (score <= 70) { priority = "P2"; priorityColor = "bg-brand-warning text-white"; }

    return {
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      title: `[${category.toUpperCase()}] — Reviews indicate issues`,
      priority,
      priorityColor,
      action: actionMap[category] || "Investigate the recent trend in customer feedback.",
      description: explanationMap[category] || `General dissatisfaction detected around ${category}.`,
      solutionDetails: solutionDetailMap[category] || "Monitor the situation and gather more granular feedback.",
      snippet: data.snippets && data.snippets.length > 0 ? data.snippets[0] : null
    };
  });
};
