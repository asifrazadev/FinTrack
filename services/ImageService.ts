export const getprofileImageUrl = (file:any)=> {
    if(file && typeof file === 'string') return file;
    if(file && typeof file==='object' ) return file.uri

    return require('../assets/images/defaultAvatar.png');
}

export const uploadImageToCloudinary = async (uri:any) => {
  const data :any= new FormData();
  data.append("file", {
    uri,
    type: "image/jpeg",
    name: "profile.jpg",
  });
  data.append("upload_preset", "project");  
  data.append("cloud_name", "dxze1vehc");
  data.append("folder", "user_profiles");

  const res = await fetch("https://api.cloudinary.com/v1_1/dxze1vehc/image/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  return json.secure_url;
};

export const getFilePath = (file:any) => {
  if(file && typeof file === 'string') return file;
    if(file && typeof file==='object' ) return file.uri
    return null;
}