import { Client } from 'pg';
import axios from 'axios';

const SERVER = 'http://82.202.226.64:27513';

const pgPost: Client = new Client('postgresql://gorod:123qwe@localhost:5432/pablo_blog');
const pgUser: Client = new Client('postgresql://gorod:123qwe@localhost:5432/pablo_user');

type User = {
  id: number,
  address: string,
  firstName: string,
  lastName: string,
  displayName: string,
};

type Post = {
  id: number,
  title: string,
  publicationTime: Date,
  addressId: number,
  addressTitle: string,
  userId: number,
};

class Collector {

  public async collect() {
    const posts: Post[] = (await pgPost.query(
      `select id, title, "publicationTime", "addressId", "addressTitle", "userId"
      from post
      where status=$1 and "creationTime" > current_timestamp - interval '5 hour'`,
      ['active'],
    )).rows;

    const usersId = [...new Set(posts.map(post => post.userId))];
    const inQuery = usersId.map(({}, index) => `$${index + 1}`).join(',');
    const users: User[] = (await pgUser.query(
      `select id, address, "firstName", "lastName", "displayName"
      from user_identity
      join user_profile on user_identity.id = user_profile."userId"
      where id in (${inQuery})`,
      usersId,
    )).rows;

    const events = posts.map((post) => {
      const user = users.find(user => user.id === post.userId) as User;
      return {
        url: `https://mel.fm/blog/${user.address}/${post.addressId}-${post.addressTitle}`,
        title: post.title,
        user: user.displayName ? user.displayName : `${user.firstName} ${user.lastName}`,
        publicationTime: post.publicationTime,
      };
    });

    console.log(events);
    await Promise.all(
      events.map(event => axios.post(`${SERVER}/post`, event)),
    );

    await Promise.all([pgPost.end(), pgUser.end()]);
  }

}

Promise.all([
  pgPost.connect(),
  pgUser.connect(),
]).then(() => {
  new Collector().collect();
});
