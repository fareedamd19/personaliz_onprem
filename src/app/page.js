import MainEntryPoint from "./components/Main Entry Point/MainEntryPoint";


// export async function generateMetadata({searchParams}) {
  
//   let campaignId = searchParams["id"]
//   let emailOfUser = searchParams["email"]
//   let contact_id = searchParams["uid"]
  
//   if(campaignId&&(contact_id||emailOfUser)){

//     let options={
//       'method': 'POST',
//       'url': `${process.env.NEXT_PUBLIC_API}/ivideo_dynamic_data`,
//       'headers': {
//           'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//           "ivideo_id": campaignId ,
//           "contact_id": contact_id??null,
//           'email_id': emailOfUser??null
//       })
//   };
//  try {
//   const response = await fetch(options.url, options)
//  const finalData=await response.json()
//  return {
//   title:'Personaliz',
//   description:finalData?.wid_thumbnail_description,
//   openGraph: {
//     title:finalData?.wid_thumbnail_title??'Created with Personaliz.ai',
//     description:finalData?.wid_thumbnail_description??'Start your personalized interactive video experience',
//     images:[
//       {
//         url: finalData?.wid_thumbnail_url
//       }
//     ]
//   }
//  }

//  } catch (error) {
//   console.error('There was a problem with your fetch operation:', error);
//  }
//   }

//   else {
//     return {
//       title:'Personaliz',
//       description:'Start your personalized interactive video experience',
//       openGraph: {
//         title:'Created with Personaliz.ai',
//         description:'Start your personalized interactive video experience',
//         images:[
//           {
//             url: 'https://dyolkjkaata8s.cloudfront.net/PersonalizBanner.jpg'
//           }
//         ]
//       }
//      }
//   }

// };

export default function Home() {

  return (
   <>
<MainEntryPoint/>
   </>
  );
}
