# Payment-Processing-System

- Req-res arch for critical operations -

          Client
            │
            │ POST /orders                                      // since order and payment are inherently reltd, it is necessary to
            ▼                                                   // put coupling 
            Order Service
            │
            │ create order = PENDING_PAYMENT
            ▼
            Order DB
            │
            │
            │ initiate payment
            ▼
            Payment Service
            │
            │ process/authorize payment
            ▼
            Payment DB
            │
            │ SUCCESS / FAILED
            ▼
            Order Service
            │
            │ update order
            ▼
            Client

EDA for post-critical transactions - 

        Payment Service
            │
            │ payment.succeeded
            ▼
        RabbitMQ
            │
            ├──> Notification
            ├──> Analytics
            └──> other consumers, mails, coupons, cr8 accounting entry


# Issues

- Concurrently not working properly - 

had two Node.js services in an npm workspace monorepo. Each service worked individually, but starting them with concurrently on Windows wasn't working correctly. I isolated the problem by testing the workspace commands individually and then simultaneously in separate terminals. That showed the application itself was fine and the problem was the process orchestration. I replaced concurrently with a small Node launcher using child_process.spawn() and launched each npm workspace through its own cmd.exe process. Both services then started correctly."

If asked "Why did concurrently fail?", the technically honest answer is:

"I couldn't conclusively identify a specific bug inside concurrently. What I established was that its nested process invocation wasn't working correctly in my Windows environment, while explicitly spawning separate cmd.exe processes did work."