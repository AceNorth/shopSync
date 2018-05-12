ETSY STORE SYNC

Before you begin, you'll need to create an .env file with a valid Etsy API key in the following format:
ETSY_API_KEY="YourApiKey"

Get a key here:
https://www.etsy.com/developers/documentation/getting_started/register

To run:

1) Type ```node app.js```

2) Make a POST request to ```localhost:3000/rpc/sync_stores```

In the body, include a list (array) of etsy store IDs. I've been using this test body:

```
{ storeIds: [17701041, 17702065, 17702047] }
```

...but you can find your own shopIds at etsy's /shops/ endpoint: https://www.etsy.com/developers/documentation/reference/shop#method_findallshops

3) The app will log the listings for each store in the /data folder, as a set of JSON files labeled according to their shop ID.

4) If you make repeat requests using some of the same storeIds, the JSON files will be updated according to the current state of each store. In addition, the app will log any changes to the listings in those stores like so:

```
Shop ID 234234
- removed listing 234987 "Cool cat shirt"
+ added listing 98743598 "Cooler cat shirt"

Shop ID 9875
No Changes since last sync

Shop 93580
+ added listing 3094583 "Artisanal cheese"
```
