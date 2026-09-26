export class GatewayError extends Error{
    constructor(message: string, public code: string){
        super(message);
        this.name = 'GatewayError'
    }
}

export class CardDeclinedError extends GatewayError{
    constructor(message = 'Card was declined'){
        super(message, 'CARD_DECLINED')
    }
}

export class GatewayTimeoutError extends GatewayError{
    constructor(message = 'Gateway timeout reached'){
        super(message, 'GATEWAY_TIMEOUT')
    }
}