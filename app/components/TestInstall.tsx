import React from 'react';

export default function TestInstall() {
  return (
    <div>
      <form>
        <label htmlFor="fname">Type:</label>
        <input type="text" id="fname" name="fname"></input>
        <br></br><br></br>

        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
}
