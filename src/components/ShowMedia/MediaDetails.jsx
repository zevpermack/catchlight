import {React, useEffect, useState} from 'react';
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
  const [ mediaInteraction, setMediaInteraction] = useState({})
  const [ mediaDetails, setMediaDetails] = useState({});

  useEffect(() => {
    const jwt = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`
      }
    }
    
    const singleMedia = axios.get(`/api/media/${id}`, jwt);
    const userInteraction = axios.get(`/api/media/${id}/interactions/`, jwt);

    Promise.all([singleMedia, userInteraction])
      .then(([media, interaction]) => {
        setMediaDetails(media.data)
        setMediaInteraction(interaction.data)
      })
  }, [id]);

  return (
   <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 mt-10 mx-10">
     <MediaPoster image={mediaDetails.image}/>
     <Title title={mediaDetails.title} description={mediaDetails.description}/>
     <RatingBar mediaInteraction={mediaInteraction}/>
     <FriendInteractions />
     <StreamsOn />
     <div className=' flex'>
     {mediaInteraction.rating === "interest" && <MediaWatchedButton>Remove from Watch List</MediaWatchedButton>}
     {mediaInteraction.rating === undefined && <MediaWatchedButton>Add to Watch List</MediaWatchedButton>}
    </div>
   </div>
  );
}