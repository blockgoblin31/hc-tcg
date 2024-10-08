import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterDefence, onTurnEnd} from '../types/priorities'
import {Counter, statusEffect} from './status-effect'

const SlownessEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'slowness',
	icon: 'slowness',
	name: 'Slowness',
	description: 'This Hermit can only use their primary attack.',
	counter: 1,
	counterType: 'turns',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		if (!effect.counter) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (
				target.slot?.onBoard() &&
				player.activeRowEntity === target.slot.row?.entity
			)
				game.addBlockedActions(this.icon, 'SECONDARY_ATTACK')
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!effect.counter) return
				effect.counter--

				if (effect.counter === 0) {
					effect.remove()
					return
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.afterDefence,
			afterDefence.ON_ROW_DEATH,
			(attack) => {
				if (
					!target.slot?.onBoard() ||
					attack.target?.entity !== target.slot.row?.entity
				)
					return
				if (target.slot.row?.health) return
				effect.remove()
			},
		)
	},
}

export default SlownessEffect
