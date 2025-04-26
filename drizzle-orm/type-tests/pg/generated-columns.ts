import { type Equal, Expect } from 'type-tests/utils';
import { type InferInsertModel, type InferSelectModel, sql } from '~/index';
import { drizzle } from '~/node-postgres';
import { integer, pgTable, serial, text, varchar } from '~/pg-core';
import { db } from './db';

const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		firstName: varchar('first_name', { length: 255 }),
		lastName: varchar('last_name', { length: 255 }),
		email: text('email').notNull(),
		fullName: text('full_name').generatedAlwaysAs(sql`concat_ws(first_name, ' ', last_name)`).notNull(),
		upperName: text('upper_name').generatedAlwaysAs(
			sql` case when first_name is null then null else upper(first_name) end `,
		),
	},
);
{
	type User = typeof users.$inferSelect;
	type NewUser = typeof users.$inferInsert;

	Expect<
		Equal<
			{
				id: number;
				firstName: string | undefined;
				lastName: string | undefined;
				email: string;
				fullName: string;
				upperName: string | undefined;
			},
			User
		>
	>();

	Expect<
		Equal<
			{
				email: string;
				id?: number | undefined;
				firstName?: string | undefined;
				lastName?: string | undefined;
			},
			NewUser
		>
	>();
}

{
	type User = InferSelectModel<typeof users>;
	type NewUser = InferInsertModel<typeof users>;

	Expect<
		Equal<
			{
				id: number;
				firstName: string | undefined;
				lastName: string | undefined;
				email: string;
				fullName: string;
				upperName: string | undefined;
			},
			User
		>
	>();

	Expect<
		Equal<
			{
				email: string;
				id?: number | undefined;
				firstName?: string | undefined;
				lastName?: string | undefined;
			},
			NewUser
		>
	>();
}

{
	const dbUsers = await db.select().from(users);

	Expect<
		Equal<
			{
				id: number;
				firstName: string | undefined;
				lastName: string | undefined;
				email: string;
				fullName: string;
				upperName: string | undefined;
			}[],
			typeof dbUsers
		>
	>();
}

{
	const db = drizzle({} as any, { schema: { users } });

	const dbUser = await db.query.users.findFirst();

	Expect<
		Equal<
			{
				id: number;
				firstName: string | undefined;
				lastName: string | undefined;
				email: string;
				fullName: string;
				upperName: string | undefined;
			} | undefined,
			typeof dbUser
		>
	>();
}

{
	const db = drizzle({} as any, { schema: { users } });

	const dbUser = await db.query.users.findMany();

	Expect<
		Equal<
			{
				id: number;
				firstName: string | undefined;
				lastName: string | undefined;
				email: string;
				fullName: string;
				upperName: string | undefined;
			}[],
			typeof dbUser
		>
	>();
}

{
	// @ts-expect-error - Can't use the fullName because it's a generated column
	await db.insert(users).values({
		firstName: 'test',
		lastName: 'test',
		email: 'test',
		fullName: 'test',
	});
}

{
	await db.update(users).set({
		firstName: 'test',
		lastName: 'test',
		email: 'test',
		// @ts-expect-error - Can't use the fullName because it's a generated column
		fullName: 'test',
	});
}

const users2 = pgTable(
	'users',
	{
		id: integer('id').generatedByDefaultAsIdentity(),
		id2: integer('id').generatedAlwaysAsIdentity(),
	},
);

{
	type User = typeof users2.$inferSelect;
	type NewUser = typeof users2.$inferInsert;

	Expect<
		Equal<
			{
				id: number;
				id2: number;
			},
			User
		>
	>();

	Expect<
		Equal<
			{
				id?: number | undefined;
			},
			NewUser
		>
	>();
}

const usersSeq = pgTable(
	'users',
	{
		id: integer('id').generatedByDefaultAsIdentity(),
		id2: integer('id').generatedAlwaysAsIdentity(),
	},
);

{
	type User = typeof usersSeq.$inferSelect;
	type NewUser = typeof usersSeq.$inferInsert;

	Expect<
		Equal<
			{
				id: number;
				id2: number;
			},
			User
		>
	>();

	Expect<
		Equal<
			{
				id?: number | undefined;
			},
			NewUser
		>
	>();
}
