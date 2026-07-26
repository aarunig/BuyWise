# BuyWise

BuyWise is an AI-powered browser extension that assists users in making informed purchasing decisions while shopping online. Rather than relying solely on product specifications and ratings, BuyWise analyzes product information, evaluates practical trade-offs, and provides contextual recommendations that help users understand which product is the better overall purchase for their needs.

The project combines rule-based decision analysis with generative AI to transform raw product data into clear, evidence-based shopping advice.

---

## Overview

Online shoppers are often presented with large amounts of product information but very little guidance on interpreting it. BuyWise addresses this problem by extracting product information directly from supported e-commerce websites, analyzing multiple decision factors, and presenting concise recommendations that prioritize long-term value, usability, and practicality.

The extension is designed to reduce decision fatigue by explaining not only *which* product is recommended, but also *why* that recommendation is made.

---

## Key Features

### AI-Powered Product Analysis

* Generates contextual buying recommendations
* Explains reasoning behind each recommendation
* Highlights strengths, concerns, and practical considerations
* Produces concise, shopper-friendly summaries

### Intelligent Product Comparison

* Compares products within the same category
* Evaluates pricing, customer feedback, brand information, and product attributes
* Identifies trade-offs between competing products
* Recommends the most suitable option based on available evidence

### Shopping Memory

* Saves products for future reference
* Maintains a comparison list across browsing sessions
* Enables users to revisit previously viewed products

### Browser Integration

* Automatically extracts product information from supported e-commerce websites
* Detects product pages without requiring manual input
* Provides recommendations directly within the browser through a side panel interface

---

## Supported Platforms

* Amazon
* Flipkart

Support for additional marketplaces is enabled through a generic scraper .

---

## System Architecture

```
Product Page
      │
      ▼
Content Script
      │
      ▼
Product Extraction
      │
      ▼
Decision Metrics
      │
      ▼
Comparison Engine
      │
      ▼
Reasoning Engine
      │
      ▼
Narrative Generation
      │
      ▼
Gemini AI
      │
      ▼
BuyWise Recommendation
```

---

## Technology Stack

### Frontend
- React
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- Responsive UI Design

### Browser Extension
- Chrome Extensions API (Manifest V3)
- Chrome Storage API
- Chrome Runtime Messaging
- Content Scripts
- Background Service Workers
- Chrome Side Panel API

### Backend
- Python
- Flask
- RESTful APIs

### Artificial Intelligence
- Google Gemini API
- Prompt Engineering
- Explainable AI (XAI)
- Rule-based Decision Intelligence

### Development Tools
- Git
- GitHub
- Visual Studio Code
- npm

## Project Structure

```
BuyWise/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── prompts/
│   ├── models/
│   └── app.py
│
├── src/
│   ├── background/
│   ├── components/
│   ├── content/
│   ├── context/
│   ├── decision/
│   ├── reasoning/
│   ├── services/
│   ├── sidepanel/
│   ├── storage/
│   └── utils/
│
├── public/
├── manifest.json
└── README.md
```

---

## Core Components

| Component          | Responsibility                                                  |
| ------------------ | --------------------------------------------------------------- |
| Product Extraction | Collects structured product information from supported websites |
| Decision Metrics   | Calculates evaluation metrics from extracted product data       |
| Comparison Engine  | Compares products and identifies evidence-based trade-offs      |
| Reasoning Engine   | Interprets evaluation metrics to generate recommendations       |
| Narrative Engine   | Produces structured explanations for users                      |
| Gemini Integration | Enhances recommendations using contextual AI reasoning          |

---

## Installation

### Clone the repository

```bash
git clone https://github.com/<username>/buywise.git
```

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

### Start the backend

```bash
python app.py
```

Load the generated extension into Chrome using **Developer Mode** and the unpacked extension option.

---

## Current Functionality

* Product information extraction
* AI-assisted purchase recommendations
* Product comparison
* Shopping memory
* Browser extension interface
* Context-aware recommendation generation

---

## Future Enhancements

* Personalized shopping preferences
* Multi-product comparison
* Price history analysis
* Wishlist synchronization
* Additional e-commerce platform support
* Recommendation refinement through user feedback

---

## License

This project is licensed under the MIT License.

---

