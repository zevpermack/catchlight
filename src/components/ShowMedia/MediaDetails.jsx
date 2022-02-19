import { React, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import RatingBar from './RatingBar';
import Title from './MediaTitle';
import MediaPoster from './MediaPoster'
import FriendInteractions from './FriendInteractions';
import MediaWatchedButton from './MediaWatchedButton';
import StreamsOn from './StreamsOn';
import axios from 'axios';

export default function MediaDetails() {
  const { id } = useParams()
  const [ mediaInteraction, setMediaInteraction ] = useState({})
  const [ mediaDetails, setMediaDetails] = useState({});
  const [ friendsAvatars, setFriendsAvatars ] = useState([]);
  const [ interactionStats, setInteractionStats ] = useState({})
  
  useEffect(() => {
    const jwt = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`
      }
    }
    
    const singleMedia = axios.get(`/api/media/${id}`, jwt);
    const userInteraction = axios.get(`/api/media/${id}/interactions/`, jwt);
    const totalUsersInteractions = axios.get(`/api/interactions/count/${id}`, jwt);
    const friendsPictures = axios.get('/api/friendsPictures', jwt);
    const mediaFriendsInteractions = axios.get('/api/mediaFriendsRecommendations', jwt);
    
    Promise.all([singleMedia, userInteraction, totalUsersInteractions, friendsPictures, mediaFriendsInteractions])
    .then(([media, userRating, interactionStats, friendsPictures, mediaFriendsInteractions]) => {
      setMediaDetails(media.data);
      setMediaInteraction(userRating.data);
      setInteractionStats(interactionStats.data[0]);
    
      const results = []

      for (const friend of friendsPictures.data) {
        for (const mediaFriend of mediaFriendsInteractions.data) {
          if (friend.friend_id === mediaFriend.id) {
            for (const interactionMedia of mediaFriend.interactions) {
              if (interactionMedia.media_id === ~~id) {
                results.push({profile_picture: friend.profile_picture});
              }
            }
          }
        }
      }
      setFriendsAvatars(results);
    })
    .catch((error) =>  {
      console.error(error)
    });
  }, [id]);
  
  return (
   <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 mt-10 mx-10">
     <MediaPoster image={mediaDetails.image}/>
     <Title title={mediaDetails.title} description={mediaDetails.description}/>
     <RatingBar interactionStats={interactionStats} setInteractionStats={setInteractionStats} mediaInteraction={mediaInteraction} setMediaInteraction={setMediaInteraction} mediaId={id}/>
     <FriendInteractions friendsAvatarArray={friendsAvatars}/>
     <StreamsOn />
     <div className=' flex'>
     {mediaInteraction.rating === "interest" && <MediaWatchedButton>Remove from Watch List</MediaWatchedButton>}
     {mediaInteraction.rating === null && <MediaWatchedButton>Add to Watch List</MediaWatchedButton>}
    </div>
   </div>
  );
}