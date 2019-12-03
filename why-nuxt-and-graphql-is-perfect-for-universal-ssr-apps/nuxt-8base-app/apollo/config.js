import { InMemoryCache } from "apollo-cache-inmemory";

export default function(context){
    return {
        httpEndpoint: 'https://api.8base.com/ck0s91rdv000k01l468909h5n',
        getAuth:() => 'Bearer f069a311-4d00-47b7-9626-2d59cf7854d9',
        cache: new InMemoryCache()
    }
}