export const state = () => ({
  album: null,
  albums: null,
  songs: null,
  loading: false
});

export const getters = {
  album: ({ album }) => album,
  albums: ({ albums }) => albums,
  songs: ({ songs }) => songs,
  loading: ({ loading }) => loading
};

export const mutations = {
  SET_ALBUM: (state, payload) => (state.album = payload),
  SET_ALBUMS: (state, payload) => (state.albums = payload),
  SET_SONGS: (state, payload) => (state.songs = payload),
  START_LOADING: state => (state.loading = true),
  FINISH_LOADING: state => (state.loading = false)
};

export const actions = {
  async getArtists({ commit, dispatch }, term) {
    commit("START_LOADING");
    try {
      // get artists ids from term
      const response = await this.$axios.$get(
        `/api/search?term=${term}&entity=musicArtist&limit=5`
      );

      // stop searching if there is no results
      if (!response.results || !response.results.length) {
        return commit("FINISH_LOADING");
      }
      // transform artists list in a string with their ids.
      // example: [{ artistId: 1, artistId: 2, artistId: 3}] => "1,2,3"
      const artistsIds = response.results
        .map(artist => artist.artistId)
        .join(",");
      dispatch("getAlbums", artistsIds);
    } catch (error) {
      return commit("FINISH_LOADING");
    }
  },
  async getAlbums({ commit }, artistsIds) {
    const response = await this.$axios.$get(
      `/api/lookup?id=${artistsIds}&entity=album&limit=100`
    );
    // filter only collection types
    const albums = response.results.filter(
      album => album.wrapperType == "collection"
    );

    commit("SET_ALBUMS", albums);
    commit("FINISH_LOADING");
  },
  async getSongs({ commit, state }) {
    commit("START_LOADING");
    try {
      const response = await this.$axios.$get(
        `/api/lookup?id=${state.album.collectionId}&entity=song&limit=100`
      );
      const songs = response.results.filter(
        song => song.wrapperType == "track"
      );
      commit("SET_SONGS", songs);
      commit("FINISH_LOADING");
    } catch (error) {
      commit("FINISH_LOADING");
    }
  }
};
