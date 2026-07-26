import { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import { useBuyWise } from "../context/BuyWiseContext";
import { askBuyWise } from "../ai/ChatService";

const QUICK_QUESTIONS = [
    { id: "worth", text: "Is it worth the price?" },
    { id: "wait", text: "Should I wait before buying?" },
    { id: "durability", text: "Will it last long?" },
    { id: "alternative", text: "Are there better alternatives?" }
];

export default function ChatBox() {

    const {

        currentProduct,
        decision,
        metrics,
        basket,
        shoppingMemory,
        messages,
        setMessages,

    } = useBuyWise();

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth",

            block: "end"

        });

    }, [

        messages,

        loading

    ]);

    async function sendMessage(customQuestion) {

        const question = customQuestion || input;

        if (!question?.trim()) return;

        const updatedMessages = [

            ...messages,

            {

                sender: "user",

                text: question

            }

        ];

        setMessages(updatedMessages);

        setInput("");

        setLoading(true);

        try {

            const reply = await askBuyWise({

                product: currentProduct,

                decision,

                metrics,

                shoppingMemory,

                compareBasket: basket,

                question,

                chatHistory: updatedMessages,

            });

            setMessages([

                ...updatedMessages,

                {

                    sender: "buywise",

                    text: reply

                }

            ]);

        }

        finally {

            setLoading(false);

        }

    }

    function handleKeyDown(e) {

        if (e.key === "Enter") {

            sendMessage();

        }

    }

    return (

        <section className="ask-buywise">

            <div className="ask-header">

                <div className="header-content">

                    <div className="ask-badge">

                        AI

                    </div>

                    <div>

                        <span className="section-label">

                            BUYWISE ASSISTANT

                        </span>

                        <h3>

                            Ask BuyWise

                        </h3>

                        <p>

                            Personal shopping advice based on your preferences.

                        </p>

                    </div>

                </div>

            </div>

            <div className="quick-actions-grid">

                {

                    QUICK_QUESTIONS.map(item => (

                        <button

                            key={item.id}

                            className="quick-btn"

                            onClick={() => sendMessage(item.text)}

                            disabled={loading}

                        >

                            <span className="btn-text">

                                {item.text}

                            </span>

                        </button>

                    ))

                }

            </div>

            <div className="chat-messages">

                {

                    messages.length === 0 && (

                        <div className="empty-state">

                            Ask me anything about this product...

                        </div>

                    )

                }

                {

                    messages.map((msg, index) => (

                        <div

                            key={index}

                            className={`message ${msg.sender === "user" ? "user" : "ai"}`}

                        >

                            {

                                msg.sender === "buywise" && (

                                    <div className="message-label">

                                        BuyWise AI

                                    </div>

                                )

                            }

                            <div className="message-content">

                                {msg.text}

                            </div>

                        </div>

                    ))

                }

                {

                    loading && (

                        <div className="message ai">

                            <div className="message-label">

                                BuyWise AI

                            </div>

                            <div className="thinking-state">

                                <span className="thinking-dot"></span>

                                <span className="thinking-dot"></span>

                                <span className="thinking-dot"></span>

                                <small>

                                    Analyzing your question...

                                </small>

                            </div>

                        </div>

                    )

                }

                <div ref={messagesEndRef}></div>

            </div>

            <div className="chat-input-area">

                <input

                    type="text"

                    placeholder="Ask anything about this product..."

                    value={input}

                    onChange={(e) => setInput(e.target.value)}

                    onKeyDown={handleKeyDown}

                    disabled={loading}

                />

                <button

                    className="send-button"

                    onClick={() => sendMessage()}

                    disabled={loading || !input.trim()}

                >

                    Send

                </button>

            </div>

        </section>

    );

}