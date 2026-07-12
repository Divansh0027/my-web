"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullSyncProperties = exports.onPropertyWritten = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const algoliasearch_1 = require("algoliasearch");
admin.initializeApp();
// Read from Firebase config if available, otherwise environment variables
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || (functions.config().algolia ? functions.config().algolia.app_id : 'test');
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || (functions.config().algolia ? functions.config().algolia.admin_key : 'test');
const client = (0, algoliasearch_1.algoliasearch)(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
// When a property is created or updated
exports.onPropertyWritten = functions.firestore
    .document('properties/{propertyId}')
    .onWrite(async (change, context) => {
    const propertyId = context.params.propertyId;
    // If the document was deleted
    if (!change.after.exists) {
        console.log(`Deleting property ${propertyId} from Algolia`);
        return client.deleteObject({
            indexName: 'properties',
            objectID: propertyId
        });
    }
    const data = change.after.data();
    if (!data)
        return null;
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
        _geoloc: data.latitude && data.longitude ? {
            lat: data.latitude,
            lng: data.longitude
        } : undefined
    };
    console.log(`Syncing property ${propertyId} to Algolia`);
    return client.saveObject({
        indexName: 'properties',
        body: algoliaObject
    });
});
// We could also have an HTTP endpoint to manually trigger a full sync
exports.fullSyncProperties = functions.https.onRequest(async (req, res) => {
    try {
        const propertiesSnapshot = await admin.firestore().collection('properties').get();
        const records = [];
        propertiesSnapshot.forEach(doc => {
            const data = doc.data();
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
                _geoloc: data.latitude && data.longitude ? {
                    lat: data.latitude,
                    lng: data.longitude
                } : undefined
            });
        });
        if (records.length > 0) {
            await client.saveObjects({
                indexName: 'properties',
                objects: records
            });
        }
        res.status(200).send(`Successfully synced ${records.length} properties to Algolia.`);
    }
    catch (error) {
        console.error('Error syncing properties:', error);
        res.status(500).send('Error syncing properties');
    }
});
//# sourceMappingURL=index.js.map