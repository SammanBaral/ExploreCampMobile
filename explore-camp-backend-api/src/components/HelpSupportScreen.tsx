import { Calendar, CreditCard, Mail, MessageCircle, Phone, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card } from './ui/card';

const helpCategories = [
    { icon: <Calendar className="w-6 h-6 text-green-600" />, title: 'Booking & Reservations', desc: 'Manage your trips' },
    { icon: <User className="w-6 h-6 text-blue-600" />, title: 'Account & Profile', desc: 'Manage your details' },
    { icon: <CreditCard className="w-6 h-6 text-yellow-600" />, title: 'Payments & Pricing', desc: 'Billing information' },
    { icon: <Shield className="w-6 h-6 text-rose-500" />, title: 'Safety & Guidelines', desc: 'Stay safe outdoors' },
];

const supportOptions = [
    { icon: <MessageCircle className="w-5 h-5 text-green-600" />, title: 'Live Chat', desc: 'Available 24/7' },
    { icon: <Mail className="w-5 h-5 text-blue-600" />, title: 'Email Support', desc: 'Response within 24 hours' },
    { icon: <Phone className="w-5 h-5 text-yellow-600" />, title: 'Call Center', desc: 'Mon-Fri, 9AM-6PM' },
];

const faqs = [
    { q: 'How do I modify my reservation?', a: 'You can modify your reservation from the Booking & Reservations section.' },
    { q: 'What’s your cancellation policy?', a: 'Our cancellation policy is flexible. Please see the full policy in your booking details.' },
    { q: 'How do I contact a campsite host?', a: 'You can contact the host via the booking details page.' },
    { q: 'What amenities are typically available?', a: 'Amenities vary by campsite. Check the listing for details.' },
];

export default function HelpSupportScreen() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Help Categories Grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
                {helpCategories.map((cat, i) => (
                    <Card key={i} className="flex flex-col items-start p-4 gap-2 shadow-none border border-muted-foreground/10">
                        {cat.icon}
                        <div className="font-semibold text-base">{cat.title}</div>
                        <div className="text-xs text-muted-foreground">{cat.desc}</div>
                    </Card>
                ))}
            </div>
            {/* Contact Support */}
            <div className="px-4 mt-2">
                <div className="font-semibold text-lg mb-2">Contact Support</div>
                <div className="space-y-2">
                    {supportOptions.map((opt, i) => (
                        <Card key={i} className="flex items-center gap-3 p-3">
                            {opt.icon}
                            <div>
                                <div className="font-medium text-sm">{opt.title}</div>
                                <div className="text-xs text-muted-foreground">{opt.desc}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            {/* FAQ Accordion */}
            <div className="px-4 mt-6">
                <div className="font-semibold text-lg mb-2">Frequently Asked Questions</div>
                <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq}>
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={faq.q}>
                            <AccordionTrigger>{faq.q}</AccordionTrigger>
                            <AccordionContent>{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
} 