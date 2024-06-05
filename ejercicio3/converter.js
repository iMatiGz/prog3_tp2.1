class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl
        this.currencies = []
    }

    async getCurrencies() {
        const result = await fetch(`${this.apiUrl}/currencies`)
        const data = await result.json()
        
        for (let key in data) {
            this.currencies.push(new Currency(key, data[key]))
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code == toCurrency.code) return amount

        try {
            const request = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`)
            const result = await request.json()

            const rates = result.rates
            const key = Object.keys(rates)
            return rates[key]
        }
        catch (err) {
            console.log('Error: ', err);
            return null
        }
    }

    async historicalCurrency(date) {
        try {
            const request = await fetch(`${this.apiUrl}/${date}`)
            if (!request.ok) return null
            return request.json()
        }
        catch (err) {
            console.log('Error: ', err);
            return null
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");
    const additionalBtn = document.getElementById("additional-btn")
    const dateInput = document.getElementById("date-input")

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
    
    additionalBtn.addEventListener('click', async () => {
        const result = await converter.historicalCurrency(dateInput.value)
        if (!result) {
            resultDiv.textContent = 'Escribiste mal la fecha'
            return
        }

        console.log(result);
        resultDiv.textContent = '-- Los resultados se están mostrando en consola --'
    })
});
