import { useState, useRef, useEffect } from 'react'
import { X, PaperPlaneTilt, Robot, Sparkle } from '@phosphor-icons/react'

export default function ChatPanel({ onClose }) {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hi! I'm NexCycle AI. Ask me anything about recycling, our sorting process, or how I work!" }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages])

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg = { id: Date.now(), sender: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                "That's a great question! Our 6DOF robot arm uses inverse kinematics to reach any position within its workspace.",
                "Plastic bottles are usually made of PET (Polyethylene Terephthalate), which is highly recyclable.",
                "I use a Convolutional Neural Network (CNN) to identify objects in real-time with 98.5% accuracy.",
                "Please make sure to empty your liquids before recycling bottles!",
                "I can sort up to 60 items per minute when running at full speed."
            ]
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: randomResponse }])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            animation: 'slideUp 0.3s ease-out'
        }}>
            {/* Header */}
            <div style={{
                padding: 16,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(16, 185, 129, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        background: 'var(--color-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black'
                    }}>
                        <Robot weight="fill" size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>NexCycle AI</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Sparkle weight="fill" /> Educational Assistant
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="btn-close" aria-label="Close">
                    <X size={18} weight="bold" />
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                        color: msg.sender === 'user' ? 'black' : 'white',
                        padding: '10px 14px',
                        borderRadius: 16,
                        borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                        borderTopLeftRadius: msg.sender === 'ai' ? 4 : 16,
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                    }}>
                        {msg.text}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        NexCycle AI is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about recycling..."
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 20,
                            padding: '10px 16px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        className="btn-primary"
                        style={{ padding: '10px', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <PaperPlaneTilt size={20} weight="fill" />
                    </button>
                </div>
            </div>
        </div>
    )
}
