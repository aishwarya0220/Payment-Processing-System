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