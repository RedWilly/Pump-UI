import React from 'react';
import Layout from '@/components/Layout';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: "What is a bonding curve?",
      answer: "A bonding curve is a mathematical curve that defines the relationship between a token's price and its supply. As the supply of tokens increases, the price increases according to the curve, and vice versa."
    },
    {
      question: "How do I create a token?",
      answer: "To create a token, go to the 'Create Token' page, fill in the required information (name, symbol, description, image, social etc..), and submit the form. You'll need to pay a small fee in BONE to cover the gas costs of deploying the token contract."
    },
    {
      question: "How is the token price determined?",
      answer: "The token price is determined by the bonding curve. As more tokens are purchased, the price increases. As tokens are sold back to the contract, the price decreases."
    },
    {
      question: "Can I sell my tokens at any time?",
      answer: "Yes, you can sell your tokens back to the contract at any time. The sell price will be determined by the current position on the bonding curve."
    },
    {
      question: "Is there a fee for buying or selling tokens?",
      answer: "There is a small fee (usually 1%) applied to both buying and selling tokens. This fee helps to incentivize long-term holding and prevent market manipulation."
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;