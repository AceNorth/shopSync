const axios = require('axios');
const fs = require('fs');

/**
  * If we're not in production, get credentials from a local .env file
*/
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

/**
  * Create an axios instance for interacting with the etsy API 
  * using our assigned API key
*/
const etsyAPI = axios.create({
  baseURL: 'https://openapi.etsy.com/v2',
  params: {
    api_key: process.env.ETSY_API_KEY
  }
});

/**
  * Creates a new record file for a shop ID or overwrites an existing one
  * @param shopId etsy shop ID
  * @param listingJSON JSON string of listings
*/

const writeToRecordFile = (shopId, listingJSON) => {
  let currentListingStream = fs.createWriteStream(`./data/${shopId}.json`);
  currentListingStream.write(listingJSON);
}

/**
  * Takes a list of etsy shop IDs and compares their inventory listings
  * to the last time shopSync was run. We store each shop's current inventory
  * in a JSON file, and log any changes in inventory to the console.
  * @param shopIds array of etsy shop IDs
*/

async function shopSync(shopIds) {
  try {
    shopIds.forEach(async shopId => {
      let outputString = `Shop ID ${shopId}`;

      const response = await etsyAPI
        .get(`/shops/${shopId}/listings/active`)
        .catch(err => console.error(err))

      const currentListings = response.data.results;

      // check if a file has already been created for this shop
      fs.access(`./data/${shopId}.json`, fs.constants.F_OK, (err) => {
        if (err) {
          // if not, create one
          outputString += `\nFile ${shopId}.json created`;
          writeToRecordFile(shopId, JSON.stringify(currentListings));
          console.log(outputString + "\n");
          return;
        }
        // if so, compare the old and new shop files and log any differences
        const previousListingStream = fs.createReadStream(`./data/${shopId}.json`);
        let previousListingString = "";

        previousListingStream.on('data', (chunk) => {
          previousListingString += chunk.toString('utf8');
        });

        previousListingStream.on('end', () => {
          const previousListings = JSON.parse(previousListingString);

          const previousListingTitles = previousListings.map(listing => {
            /**
              * The odd syntax here is because the listing title needs to
              * be in quotes, but not the ID.
            */
            return listing.listing_id + ' "' + listing.title + '"';
          });

          const newListingTitles = currentListings.map(listing => {
            return listing.listing_id + ' "' + listing.title + '"';
          });

          /**
            * Comment out lines 71-81 and uncomment the ones below
            * to manually test the comparison functions and output.
            * Etsy stores don't change their listings very often.
          */
         
          // const previousListingTitles = [
          //   "Crab Hat",
          //   "Dab Hat",
          //   "Lab Hat",
          // ]

          // const newListingTitles = [
          //   "Crab Hat",
          //   "Dab Hat",
          //   "Little Baby Duck",
          // ]

          const removedListingTitles = previousListingTitles.filter(x => !newListingTitles.includes(x));
          removedListingTitles.forEach(title => {
            outputString += `\n- removed listing ${title}`;
          })

          const addedListingTitles = newListingTitles.filter(x => !previousListingTitles.includes(x));
          addedListingTitles.forEach(title => {
            outputString += `\n+ added listing ${title}`;
          })

          if (addedListingTitles.length === 0 && removedListingTitles.length === 0) {
            outputString += "\nNo changes since last sync";
          }

          writeToRecordFile(shopId, JSON.stringify(currentListings));

          console.log(outputString + "\n");
        });
      });
    })
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  shopSync,
};
