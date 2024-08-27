export interface PayUConfirmation extends Document  {
    readonly date: Date,
    readonly pse_reference3: string,
    readonly payment_method_type: number,
    readonly pse_reference2: string,
    readonly franchise: string,
    readonly commision_pol: number,
    readonly pse_reference1: string,
    readonly shipping_city: string,
    readonly bank_referenced_name: string,
    readonly sign: string,
    readonly extra2: string,
    readonly extra3: string,
    readonly operation_date: Date,
    readonly payment_request_state: string,
    readonly billing_address: string,
    readonly extra1: string,
    readonly administrative_fee: number,
    readonly administrative_fee_tax: number,
    readonly bank_id: string,
    readonly nickname_buyer: string,
    readonly payment_method: number,
    readonly attempts: number,
    readonly transaction_id: string,
    readonly transaction_date: Date,
    readonly test: boolean,
    readonly exchange_rate: number,
    readonly ip: string,
    readonly reference_pol: string,
    readonly cc_holder: string,
    readonly tax: number,
    readonly antifraudMerchantId: string,
    readonly pse_bank: string,
    readonly state_pol: string,
    readonly billing_city: string,
    readonly phone: string,
    readonly error_message_bank: string,
    readonly shipping_country: string,
    readonly error_code_bank: string,
    readonly cus: string,
    readonly commision_pol_currency: string,
    readonly customer_number: number,
    readonly description: string,
    readonly merchant_id: number,
    readonly administrative_fee_base: number,
    readonly authorization_code: string,
    readonly currency: string,
    readonly shipping_address: string,
    readonly nickname_seller: string,
    readonly cc_number: string,
    readonly installments_number: number,
    readonly value: number,
    readonly transaction_bank_id: string,
    readonly billing_country: string,
    readonly response_code_pol: string,
    readonly payment_method_name: string,
    readonly office_phone: string,
    readonly email_buyer: string,
    readonly payment_method_id: number,
    readonly response_message_pol: string,
    readonly account_id: number,
    readonly airline_code: string,
    readonly pseCycle: string,
    readonly risk: number,
    readonly reference_sale: string,
    readonly additional_value: number,
    readonly json: string
}