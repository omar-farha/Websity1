import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Images, HelpCircle, Route, Tags } from "lucide-react";

const sections = [
  {
    href: "/dashboard/content/portfolio",
    icon: Images,
    title: "Portfolio",
    description: "The case studies shown on the public site's homepage and project pages.",
  },
  {
    href: "/dashboard/content/categories",
    icon: Tags,
    title: "Categories",
    description: "The business types (Brands, Gym & Sportswear, Clinics…) used to filter projects and tag leads.",
  },
  {
    href: "/dashboard/content/faqs",
    icon: HelpCircle,
    title: "FAQs",
    description: "The frequently asked questions section.",
  },
  {
    href: "/dashboard/content/approach",
    icon: Route,
    title: "Approach",
    description: "The step-by-step process timeline.",
  },
];

export default function ContentHubPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Content
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Edit what&apos;s shown on the public site — changes go live immediately, no code or redeploy needed.
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.href} variant="outlined" sx={{ borderColor: "divider" }}>
              <CardActionArea component={Link} href={s.href}>
                <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Icon size={22} />
                  <Box>
                    <Typography fontWeight={600}>{s.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
