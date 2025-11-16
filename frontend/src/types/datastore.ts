export type DatastoreType = 'postgresql' | 'mongodb' | 's3' | 'redis' | 'mysql' | 'elasticsearch' | 'dynamodb' | 'kafka'

export interface Datastore {
  id: string
  name: string
  type: DatastoreType
}
