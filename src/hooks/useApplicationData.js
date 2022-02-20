import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";


export function useApplicationData() {
  const { id } = useParams(); // media id
  const [ mediaInteraction, setMediaInteraction ] = useState({}); // set user interaction with media
  const [ mediaDetails, setMediaDetails] = useState({});
  const [ friendsAvatars, setFriendsAvatars ] = useState([]);
  const [ interactionStats, setInteractionStats ] = useState({});
  const [ streamingServices, setStreamingServices ] = useState([]);
  const [ buttonState, setButtonState ] = useState('');
  const jwt = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('userToken')}`
    }
  };

  // --------------------Post Requests-------------------------------

  const postMediaButtonClick = rating => {
    axios.post('/api/interactions', {rating, id}, jwt)
    .catch((err) => console.log(err));
  };

  //----------------- mediaDetails business logic--------------------
  // if current rating === interest, render remove from watch list
  // else if !currentRating, render Add to Watch List
  // else Watch it again!
  // 
  // for remove from watchlist, onclick = setCurrentRating(null)
  // for addToWatchList, onclick = setCurrentRating('interest')
  // for watchItAgain, onclick = setCurrentrating('interest')
  // 
  // when adding face, setCurrentRating = "like dislike meh"
  // when removing face, setCurrentRating = null

  function decrementRating(newInteractionStats, currentRating) {
    newInteractionStats[`${currentRating}_count`] = parseInt(newInteractionStats[`${currentRating}_count`]) - 1;
    newInteractionStats[`total_count`] = parseInt(newInteractionStats[`total_count`]) - 1;
  };

  function incrementRating(newInteractionStats, ratingType) {
    newInteractionStats[`${ratingType}_count`] = parseInt(newInteractionStats[`${ratingType}_count`]) + 1;
    newInteractionStats[`total_count`] = parseInt(newInteractionStats[`total_count`]) + 1;
  };


// handles the rating bar when clicking the like dislike meh faces
  function handleRatingClick(ratingType) {
    let currentRating = mediaInteraction.rating;
    let newInteractionStats = {...interactionStats};

    if(currentRating && currentRating !== 'interest') {
      // this conditional decreases the rating of the stat previously selected stat by one
      decrementRating(newInteractionStats, currentRating);
      setButtonState(null);
    }

    if(currentRating !== ratingType && ratingType !== 'interest') {
      // when a user selects a different rating for media, it changes the stats related to the media
      incrementRating(newInteractionStats, ratingType);
      setButtonState(ratingType);
    }

    // sets state object with new rating value, newRating changes depending which is selected
    const newRating = currentRating !== ratingType ? ratingType : null;
    setMediaInteraction({...mediaInteraction, rating: newRating});
    setInteractionStats(newInteractionStats);
    postMediaButtonClick(newRating);
  };

  // --------------------------GET requests and data manipulation----------------------------
  
  useEffect(() => {    

    const singleMedia = axios.get(`/api/media/${id}`, jwt);
    const userInteraction = axios.get(`/api/media/${id}/interactions/`, jwt);
    const totalUsersInteractions = axios.get(`/api/interactions/count/${id}`, jwt);
    const friendsPictures = axios.get('/api/friendsPictures', jwt);
    const mediaFriendsInteractions = axios.get('/api/mediaFriendsRecommendations', jwt);
    const getStreamingServices = axios.get(`/api/streamingServices/${id}`, jwt);
    
    Promise.all([singleMedia, userInteraction, totalUsersInteractions, friendsPictures, mediaFriendsInteractions, getStreamingServices])
    .then(([media, userRating, interactionStats, friendsPictures, mediaFriendsInteractions, getStreamingServices]) => {
      setMediaDetails(media.data);
      setMediaInteraction(userRating.data);
      setInteractionStats(interactionStats.data[0]);
      setButtonState(userRating.data.rating);
      setStreamingServices(getStreamingServices.data.rows);
      
    
      const results = [];

      for (const friend of friendsPictures.data) {
        for (const mediaFriend of mediaFriendsInteractions.data) {
          if (friend.friend_id === mediaFriend.id) {
            for (const interactionMedia of mediaFriend.interactions) {
              if (interactionMedia.media_id === parseInt(id)) {
                results.push({
                  profile_picture: friend.profile_picture,
                  rating: interactionMedia.rating
                });
              }
            }
          }
        }
      }
      setFriendsAvatars(results);
    })
    .catch((error) =>  {
      console.error(error);
    });
  }, []);

  return { 
    id, 
    jwt,
    mediaInteraction, 
    mediaDetails, 
    friendsAvatars, 
    interactionStats, 
    streamingServices, 
    buttonState, 
    setButtonState,
    postMediaButtonClick,
    handleRatingClick
  }
};