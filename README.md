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

EDA for post-critical transactions -                        // modified this part. added an outbox layer where payment writes to outBox model of db
                                                            // rabbitmq picks up this event and consumers(notificatn service) act upon it. thus decoupling
        Payment Service                                     // order/payment from notification service
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

- - Docker - 
    Docker internal DNS; HOST VS URL mismatch - The variable name itself doesn't matter; the code and Compose must use the same name. REDIS_HOST=cache is a host. REDIS_URL=redis://cache:6379 is a complete URL. A library expecting url cannot receive just cache (eg. prisma adapters req url)

ECONNREFUSED vs DNS failure

ENOTFOUND → hostname/DNS problem.

ECONNREFUSED → hostname resolved, but nothing is accepting connections on that port.

- RabbitMQ takes time to initialize

Your logs showed:

Time to start RabbitMQ: 16585 ms

Therefore a startup grace period such as start_period: 20s is useful.