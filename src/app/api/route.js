import { NextResponse } from "next/server"

export async function POST(req){
  const data=await req.json()

  if(data?.campaignId===null){
    return 
  }
  else{
    return NextResponse.json({
      name: 'John Doe',
    })
  }
  
}
