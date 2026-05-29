import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "room" })
export class Room {
	@PrimaryKey({ type: "string" })
	id!: string; // same as roomId

	@Property({
		type: "string",
		fieldName: "creator_session_id",
	})
	creatorSessionId!: string;

	constructor(params: { id: string; creatorSessionId: string }) {
		this.id = params.id;
		this.creatorSessionId = params.creatorSessionId;
	}
}

