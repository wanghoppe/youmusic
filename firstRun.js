import * as FileSystem from 'expo-file-system';
import {db, TRACK_DIR} from './styleConst';


const CREATE_TABLE = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS Playlists (
  lst_name TEXT PRIMARY KEY,
);

CREATE TABLE IF NOT EXISTS Tracks (
  track_name TEXT PRIMARY KEY,
);

CREATE TABLE IF NOT EXISTS Linking (
  fk_lst_name TEXT,
  fk_track_name TEXT,
  PRIMARY KEY (fk_lst_name, fk_track_name),
  FOREIGN KEY (fk_lst_name)
    REFERENCES Playlists (lst_name)
    ON DELETE CASCADE,
  FOREIGN KEY (fk_track_name)
    REFERENCES Tracks (track_name)
    ON DELETE CASCADE
);
`

export async function first_run(){
  db.transaction(tx => {
    tx.executeSql(CREATE_TABLE);
  });
  const dir_info = await FileSystem.getInfoAsync(TRACK_DIR);
  if (!dir_info.exists){
    FileSystem.makeDirectoryAsync(TRACK_DIR);
  }
}
