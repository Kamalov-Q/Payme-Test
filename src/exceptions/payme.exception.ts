export class PaymeException {
    constructor(
        public code: number,
        public message: string,
        public data?: string
    ) { }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: {
                    uz: this.message,
                    ru: this.message,
                    en: this.message
                },
                data: this.data
            }
        }
    }

}