import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: 'share' })
export class Share {
  @PrimaryKey({ type: 'string' })
  id!: string;

  @Property({ type: 'text' })
  payload!: string;

  @Property({ type: 'datetime', fieldName: 'created_at' })
  createdAt!: Date;

  constructor(data: {
    id: string;
    payload: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.payload = data.payload;
    this.createdAt = data.createdAt;
  }
}

