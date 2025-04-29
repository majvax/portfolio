"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useState, useRef } from "react"
import { /*Mail, MessageSquare,*/ Send } from "lucide-react"

// Form validation schema
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
})

export function ContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    // Initialize form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    })

    // Form submission handler
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        // In a real application, you would send this data to your backend
        if (formRef.current) {
            fetch(
                "https://formsubmit.co/ajax/849735bb5cbeaf9f295df4bb1a48664e", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(values),
            }
            ).then((response) => {
                if (response.ok) {
                    setIsSubmitting(false)
                    setIsSubmitted(true)
                    form.reset()
                } else {
                    throw new Error("An error occurred. Please try again.")
                }
            }).catch((error) => {
                setIsSubmitting(false)
                alert(error.message)
            });
        }






        // Simulate API delay
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSubmitted(true)
            form.reset()
        }, 1500)
    }

    return (
        <section id="contact" className="h-screen w-full flex items-center pt-16">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4 text-center"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Contact Me</h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl">
                            Have a question or want to work together? Send me a message!
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-12">
                    {/* Contact Information */}
                    {/* <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold">Get In Touch</h3>
                        <p className="text-muted-foreground">
                            I'm currently looking for new opportunities and challenges in software engineering and cybersecurity.
                            Whether you have a question or just want to say hi, I'll try my best to get back to you!
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Email</h4>
                                <p className="text-sm text-muted-foreground">your-email@example.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Social Media</h4>
                                <p className="text-sm text-muted-foreground">
                                    Find me on <a href="https://github.com/majvax" target="_blank" className="underline">GitHub</a>
                                </p>
                            </div>
                        </div>
                    </motion.div> */}

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {isSubmitted ? (
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <div className="flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Send className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">Message Sent!</h3>
                                    <p className="text-muted-foreground">
                                        Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSubmitted(false)}
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form
                                    ref={formRef}
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="rounded-lg border bg-card p-6 shadow-sm space-y-4">

                                    <input type="text" name="_honey" style={{ display: "none" }} />
                                    <input type="hidden" name="_next" value="" />
                                    <input type="hidden" name="_captcha" value="false" />
                                    <input type="hidden" name="_subject" value="New Portfolio Contact Message" />
                                    <input type="hidden" name="_template" value="table" />

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your email address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Your message"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
