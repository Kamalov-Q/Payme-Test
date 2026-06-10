export default () => ({
    payme: {
        merchantId: process.env.PAYME_MERCHANT_ID,
        key: process.env.PAYME_KEY,
        checkoutUrl: process.env.PAYME_CHECKOUT_URL || 'https://checkout.paycom.uz
        '
    }
})