const request = require('request')
const cheerio = require('cheerio')
const parseDomain = require('parse-domain')
const currencyFormatter = require('currency-formatter')

const imgID = '#prd_mainProductImage'
const titleClass = '.prd_shortInfo__text'
const priceID = '#normalPriceAmount'
const reducedPriceID = '#reducedPriceAmount'

const imgAttribute = 'src'

const currency_mapping = {
  'de' : 'EUR'
}

function getCurrency (url){
  const tld = parseDomain(url).tld
  return currency_mapping[tld]
}

const parse = (url) => {
  const currency = getCurrency (url)
  request(url, function (error, response, html) {
    const parsed_data = { image : '', name : '', amount : '', currency : currency, shop: 'Otto', url }

    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html)

      $(titleClass).filter(function(){
        const data = $(this)
        parsed_data.name=data.children('h1').text().trim()
      })

      $(reducedPriceID).filter(function(){
        const data = $(this)
        parsed_data.amount=currencyFormatter.unformat(data.text(),{code : currency})
      })

      //if the proce is not reduced
      if(parsed_data.amount==''){
        $(priceID).filter(function(){
          const data = $(this)
          parsed_data.amount=currencyFormatter.unformat(data.text(),{code : currency})
        })
      }

      $(imgID).filter(function(){
        const data = $(this)
        parsed_data.image=data.attr(imgAttribute)
      })

    }

    console.log(JSON.stringify(parsed_data))
  })
}

module.exports = parse