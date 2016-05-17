const {OperationHelper} = require('apac')

const helper = new OperationHelper({
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  assocId: null,
  locale: 'JP'
})


async function createCart(asin) {
  const {result} = await helper.execute('CartCreate', {
    'Item.1.ASIN': asin,
    'Item.1.Quantity': 1
  })

  return {
    purchase_url: result.CartCreateResponse.Cart.PurchaseURL,
    mobile_cart_url: result.CartCreateResponse.Cart.MobileCartURL
  }
}


async function searchItems(keywords) {
  const {result} = await helper.execute('ItemSearch', {
    SearchIndex: 'All',
    Keywords: keywords,
    ResponseGroup: 'Small,OfferFull,Images'
  })

  if (result.ItemSearchResponse.Items.Request.IsValid == 'True') {
    return result.ItemSearchResponse.Items.Item
      .slice(0, 5)
      .map(item => {
        let merchant, offer = {}

        if (item.Offers) {
          merchant = item.Offers.Offer.Merchant.Name
          offer.text = item.Offers.Offer.OfferListing.Price.FormattedPrice
        }

        return Object.assign({}, {
          color: (merchant == 'Amazon.co.jp') ? '#36a64f' : '#e3e4e6',
          title: item.ItemAttributes.Title,
          title_link: item.DetailPageURL,
          thumb_url: item.LargeImage.URL
        }, offer)
      })
  }

  throw new Error(result.ItemSearchResponse.Items.Request.Errors.Error.Message)
}


module.exports.createCart = createCart
module.exports.searchItems = searchItems
