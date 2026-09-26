import { GatewayTimeoutError, GatewayError, CardDeclinedError } from "./gatewayErrors.js";

export interface ChargeRequest {
    amount: string,
    order_id: string
}

export interface ChargeResponse {
    gateway_response: string
    status: 'SUCCEEDED' | 'FAILED'
}

export class MockGatewayService {
    async charge(request: ChargeRequest): Promise<ChargeResponse>{

        await new Promise((resolve) => setTimeout(resolve, 800))

        if(request.amount == '402'){
            throw new CardDeclinedError()
        }

        if(request.amount == '502'){
            throw new GatewayTimeoutError()
        }

        if(Math.random() < 0.05){
            throw new GatewayTimeoutError('Random gateway connection drop')
        }

        return {
            gateway_response: `txn_mock_${Math.random().toString(36).substring(2,11)}`,
            status: 'SUCCEEDED'
        }
    }
}

export const mockGateway = new MockGatewayService()