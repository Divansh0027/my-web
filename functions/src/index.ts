import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { algoliasearch } from 'algoliasearch'

admin.initializeApp()

// Read from Firebase config if available, otherwise environment variables
const ALGOLIA_APP_ID =
  process.env.ALGOLIA_APP_ID ||
  (functions.config().algolia ? functions.config().algolia.app_id : 'test')
const ALGOLIA_ADMIN_KEY =
  process.env.ALGOLIA_ADMIN_KEY ||
  (functions.config().algolia ? functions.config().algolia.admin_key : 'test')

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

// When a property is created or updated
export const onPropertyWritten = functions.firestore
  .document('properties/{propertyId}')
  .onWrite(async (change, context) => {
    const propertyId = context.params.propertyId

    // If the document was deleted
    if (!change.after.exists) {
      console.log(`Deleting property ${propertyId} from Algolia`)
      return client.deleteObject({
        indexName: 'properties',
        objectID: propertyId,
      })
    }

    const data = change.after.data()

    if (!data) return null

    // We can filter out fields we don't want to be searchable
    const algoliaObject = {
      objectID: propertyId,
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      locality: data.locality,
      city: data.city,
      type: data.type,
      category: data.category,
      bhk: data.bhk,
      area: data.area,
      areaUnit: data.areaUnit,
      amenities: data.amenities,
      possession: data.possession,
      verified: data.verified,
      images: data.images ? data.images.slice(0, 1) : [], // only send first image for thumbnail
      _geoloc:
        data.latitude && data.longitude
          ? {
              lat: data.latitude,
              lng: data.longitude,
            }
          : undefined,
    }

    console.log(`Syncing property ${propertyId} to Algolia`)
    return client.saveObject({
      indexName: 'properties',
      body: algoliaObject,
    })
  })

// We could also have an HTTP endpoint to manually trigger a full sync
export const fullSyncProperties = functions.https.onRequest(async (req, res) => {
  const appCheckToken = req.headers['x-firebase-appcheck']
  if (!appCheckToken) {
    res.status(401).send('Unauthorized: Missing App Check token')
    return
  }
  try {
    await admin.appCheck().verifyToken(appCheckToken as string)
  } catch (err) {
    res.status(403).send('Unauthorized: Invalid App Check token')
    return
  }

  try {
    const propertiesSnapshot = await admin.firestore().collection('properties').get()
    const records: any[] = []

    propertiesSnapshot.forEach((doc) => {
      const data = doc.data()
      records.push({
        objectID: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        locality: data.locality,
        city: data.city,
        type: data.type,
        category: data.category,
        bhk: data.bhk,
        area: data.area,
        areaUnit: data.areaUnit,
        amenities: data.amenities,
        possession: data.possession,
        verified: data.verified,
        images: data.images ? data.images.slice(0, 1) : [],
        _geoloc:
          data.latitude && data.longitude
            ? {
                lat: data.latitude,
                lng: data.longitude,
              }
            : undefined,
      })
    })

    if (records.length > 0) {
      await client.saveObjects({
        indexName: 'properties',
        objects: records,
      })
    }

    res.status(200).send(`Successfully synced ${records.length} properties to Algolia.`)
  } catch (error) {
    console.error('Error syncing properties:', error)
    res.status(500).send('Error syncing properties')
  }
})
