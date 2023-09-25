export const emailStrings = {
    verificationCode: (code) =>{
        return `<!DOCTYPE html>
    <html>
    <head>
      <title>HTML Email Example</title>
      <style>
      .notifications{
        max-width: 768px;
      };
      h1{
      text-align: center;
      };
       .code{
        margin: 0 10px;
        font-weight: bold;
        font-size: 20px;
       };
      </style>
    </head>
    <body>
    <div class="container">
     <h1>Welcome Back</h1>
      <p>There was an attempt to login to your account, if this is you please use below code</p>
      <p class="code">${code}</p>
      <p>If you have not accepted login attempts, please <a href="https://example.com">update </a> your security settings.</p>
    </div>
    </body>
    </html>`;
    },
    registration: () =>{
        return `<!DOCTYPE html>
    <html>
    <head>
      <title>HTML Email Example</title>
      <style>
      h1{
      text-align: center;
      }
      .notifications{
        max-width: 768px;
      };
      </style>
    </head>
    <body>
    <div class="container">
     <h1>Thank you for registering!</h1>
      <p>Thank you for registering! Please activate your account using the button below.</p>
      <a href="/example/" class="bottom">Sign in</a>
    </div>
    </body>
    </html>`
    }
}


export const userString = "firstname lastname email phoneNumber aboutUser createdAt rating reports userAvatar deals isActivate userStatus favoritesUsers blockedUsers city country nickname isOnline lastOnline chatsInfo productsType";
export const userLoginString = "firstname lastname email phoneNumber aboutUser createdAt reports updatedAt rating userAvatar deals userStatus isActivate hashPassword favoritesUsers isOnline lastOnline blockedUsers city country nickname chatsInfo productsType";

export const usersString = "firstname lastname nickname createdAt deals userAvatar city country rating"