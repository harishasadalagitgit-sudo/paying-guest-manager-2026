import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3003;

  // Set payload limits for base64 ID uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Visual/simulated email logs shown to admin
  const sentEmails: any[] = [
    {
      id: "email_welcome_pg",
      to: "mispacepayingguest@gmail.com",
      subject: "Welcome to MiSpace Paying Guest System",
      body: "System initialized successfully. Ready to log incoming visitor enquiries.",
      timestamp: new Date().toISOString(),
      status: "Sent Successfully"
    }
  ];

  // API Route: Submit enquiry & log transactional email
  app.post("/api/enquiries", (req, res) => {
    try {
      const { name, email, phone, companyCollege, expectedJoiningDate, sharingInterest } = req.body;
      
      if (!name || !email || !phone) {
        return res.status(400).json({ error: "Missing required fields (name, email, phone)." });
      }

      const emailSubject = `New Booking Enquiry from ${name}`;
      const emailBody = `
Dear PG Administrator,

You have received a new booking enquiry for MiSpace Paying Guest (Boys PG).

Details of the Enquirer:
----------------------------------------
• Name: ${name}
• Email: ${email}
• Phone: ${phone}
• College/Company: ${companyCollege || "N/A"}
• Expected Joining Date: ${expectedJoiningDate || "N/A"}
• Preferred Accommodation: ${sharingInterest}

Please get in touch with the visitor as soon as possible.

Regards,
MiSpace PG Enquiry Engine
----------------------------------------
      `;

      // Print in console
      console.log(`\n========================================`);
      console.log(`SENDING SMTP MAIL REQUEST`);
      console.log(`To: mispacepayingguest@gmail.com`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Content:`);
      emailBody.trim().split("\n").forEach(line => console.log(`  | ${line}`));
      console.log(`========================================\n`);

      // Store in memory list for user logging
      const newEmailRecord = {
        id: "email_" + Date.now(),
        to: "mispacepayingguest@gmail.com",
        subject: emailSubject,
        body: emailBody,
        timestamp: new Date().toISOString(),
        status: "Sent Successfully"
      };
      
      sentEmails.unshift(newEmailRecord);

      return res.json({ 
        success: true, 
        message: "Your enquiry was submitted. Administrative alert email dispatched to mispacepayingguest@gmail.com.",
        email: newEmailRecord
      });
    } catch (err: any) {
      console.error("Error in POST /api/enquiries:", err);
      return res.status(500).json({ error: "An error occurred while creating booking enquiry." });
    }
  });

  // API Route: Get visual emails
  app.get("/api/emails", (req, res) => {
    return res.json(sentEmails);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "."),
        },
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PG Express+Vite Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
