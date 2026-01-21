import database from "@/database/database";
import { castRowToPost } from "./utils";

export default async function getAllPosts() {
	const postsRaw = await database.execute(`SELECT * FROM posts`);

	const posts = postsRaw.rows.map(castRowToPost);

	return posts;
}
